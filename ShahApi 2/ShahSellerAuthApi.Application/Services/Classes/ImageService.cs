using System.Net.Mime;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;
using SixLabors.ImageSharp;
using IMinioClientFactory = Minio.AspNetCore.IMinioClientFactory;


namespace ShahSellerAuthApi.Application.Services.Classes
{
    public class ImageService
    {
        private readonly IMinioClient _minioClient;
        private readonly string _bucketName;
        
        public ImageService(IConfiguration configuration, IMinioClientFactory minioClientFactory)
        {
            var minioSection = configuration.GetSection("Minio");
            var endpoint = minioSection["Host"];
            var accessKey = minioSection["AccessKey"] ?? "admin";
            var secretKey = minioSection["SecretKey"] ?? "admin12345";
            _bucketName = configuration["MinioBucketName"] ?? throw new ApplicationException("MinioBucketName is required.");
            _minioClient = minioClientFactory.CreateClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .Build();
        }

        // Compress an image and return as byte array
        public async Task<Image> CompressImageAsync(IFormFile file, string outputPath, long quality = 75L)
        {
            using var imageStream = file.OpenReadStream();
            using var image = Image.Load(imageStream);
            
            
    
            return Image;
        }
        {
            using var image = MediaTypeNames.Image.FromStream(imageStream);
            using var ms = new MemoryStream();
            var encoder = GetEncoder(ImageFormat.Jpeg);
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = new EncoderParameter(Encoder.Quality, quality);
            image.Save(ms, encoder, encoderParams);
            return ms.ToArray();
        }

        // Upload image to Minio
        public async Task<string> UploadImageAsync(string fileName, Stream imageStream)
        {
            // Ensure bucket exists
            bool found = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucketName));
            if (!found)
                await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucketName));

            await _minioClient.PutObjectAsync(new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithStreamData(imageStream)
                .WithObjectSize(imageStream.Length)
                .WithContentType("image/jpeg"));

            return $"{_bucketName}/{fileName}";
        }

        // Download image from Minio
        public async Task<Stream> DownloadImageAsync(string fileName)
        {
            var ms = new MemoryStream();
            await _minioClient.GetObjectAsync(new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileName)
                .WithCallbackStream(stream => stream.CopyTo(ms)));
            ms.Position = 0;
            return ms;
        }

        // Helper to get JPEG encoder
        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            var codecs = ImageCodecInfo.GetImageDecoders();
            foreach (var codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                    return codec;
            }
            return null;
        }
    }
}

