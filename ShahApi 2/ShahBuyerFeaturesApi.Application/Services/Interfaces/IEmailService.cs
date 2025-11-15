using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace ShahBuyerFeaturesApi.Application.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string body, string? attachmentName = null, byte[]? attachment = null, string? contentType = null);
    }

    public class SmtpEmailService : IEmailService
    {
        private readonly string _host;
        private readonly int _port;
        private readonly bool _enableSsl;
        private readonly string _username;
        private readonly string _password;
        private readonly string _from;

        public SmtpEmailService(IConfiguration configuration)
        {
            _host = configuration["Email:Host"] ?? "localhost";
            _port = int.TryParse(configuration["Email:Port"], out var p) ? p : 587;
            _enableSsl = bool.TryParse(configuration["Email:EnableSsl"], out var ssl) ? ssl : true;
            var from = configuration["Email:From"] ?? string.Empty;
            var username = configuration["Email:Username"] ?? string.Empty;
            _password = configuration["Email:Password"] ?? string.Empty;

            // Fallbacks: Gmail typically requires full email as username
            if (string.IsNullOrWhiteSpace(username) || !username.Contains('@'))
            {
                username = from;
            }
            if (string.IsNullOrWhiteSpace(from))
            {
                from = username;
            }
            _username = username;
            _from = from;
        }

        public async Task SendAsync(string to, string subject, string body, string? attachmentName = null, byte[]? attachment = null, string? contentType = null)
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_from);
            message.To.Add(new MailAddress(to));
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = false;

            if (attachment != null && !string.IsNullOrWhiteSpace(attachmentName))
            {
                var stream = new MemoryStream(attachment);
                var att = new Attachment(stream, attachmentName, contentType ?? "application/octet-stream");
                message.Attachments.Add(att);
            }

            using var client = new SmtpClient(_host, _port)
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                EnableSsl = _enableSsl,
                Credentials = new NetworkCredential(_username, _password)
            };

            await client.SendMailAsync(message);
        }
    }
}
