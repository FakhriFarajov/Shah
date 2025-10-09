using System.Net.Mime;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using ShahSellerAuthApi.Application.Services.Interfaces;
using ShahSellerAuthApi.Contracts.DTOs.Response;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;


namespace ShahSellerAuthApi.Application.Services.Classes
{
    public class ImageService : IImageService
    {
        private readonly IMinioClient _minioClient;
        private readonly string _bucketName;
        
        public ImageService(IConfiguration configuration)
        {
            _minioClient = new MinioClient()
                .WithEndpoint(configuration["Minio:Host"])
                .WithCredentials(configuration["Minio:AccessKey"], configuration["Minio:SecretKey"]).Build();
            _bucketName = configuration["Minio:BucketName"] ?? throw new ArgumentNullException("BucketName is not configured");
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
          
          var url = await _minioClient.PresignedPutObjectAsync(
              new PresignedPutObjectArgs()
                  .WithBucket(_bucketName)
                  .WithObject(objectName)
                  .WithExpiry(60 * 60)
          );

          await _minioClient.PutObjectAsync(putObjectArgs);
          return TypedResult<object>.Success(url, "Image uploaded successfully");
      }
      
      
      public async Task<Stream> DownloadImageAsync(string fileName)
        {
            var ms = new MemoryStream();
            var getObjectArgs = new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithCallbackStream(stream =>
                {
                    stream.CopyTo(ms);
                });
            await _minioClient.GetObjectAsync(getObjectArgs);
            ms.Position = 0;
            return ms;
        }
    }
}
