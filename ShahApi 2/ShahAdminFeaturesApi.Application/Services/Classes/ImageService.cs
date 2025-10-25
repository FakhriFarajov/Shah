using System.Net.Mime;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using ShahAdminFeaturesApi.Core.DTOs.Response;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;

namespace ShahAdminFeaturesApi.Application.Services.Classes
{
    public class ImageService
    {
        private readonly IMinioClient _minioClient;
        private readonly string _bucketName;

        public ImageService(IConfiguration configuration)
        {
            _minioClient = new MinioClient()
                .WithEndpoint(configuration["Minio:Host"])
                .WithCredentials(configuration["Minio:AccessKey"], configuration["Minio:SecretKey"]).Build();
            _bucketName = configuration["Minio:BucketName"] ??
                          throw new ArgumentNullException("BucketName is not configured");
        }

        public async Task<TypedResult<object>> UploadImageAsync(IFormFile file)
        {
            var beArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(beArgs);
            if (!found)
            {
                var mbArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(mbArgs);
            }

            using var imageStream = file.OpenReadStream();
            using var image = await Image.LoadAsync(imageStream);
            var encoder = new WebpEncoder
            {
                Quality = 75,
            };


            var objectName = $"{Guid.NewGuid()}.webp";
            using var outputStream = new MemoryStream();
            await image.SaveAsync(outputStream, encoder);
            outputStream.Position = 0;


            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(outputStream)
                .WithObjectSize(outputStream.Length)
                .WithContentType(MediaTypeNames.Image.Webp);
            
            await _minioClient.PutObjectAsync(putObjectArgs);
            return TypedResult<object>.Success(new { ObjectName = objectName }, "Image uploaded successfully");
        }
        
        public async Task<string> GetImageUrlAsync(string objectName)
        {
            var getUrl = await _minioClient.PresignedGetObjectAsync(
                new PresignedGetObjectArgs()
                    .WithBucket(_bucketName)
                    .WithObject(objectName)
                    .WithExpiry(60 * 60) // 1 hour
            );
            return getUrl;
        }

    }
}