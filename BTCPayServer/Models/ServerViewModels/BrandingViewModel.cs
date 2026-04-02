using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace BTCPayServer.Models.ServerViewModels;

public class BrandingViewModel
{
    [Display(Name = "Server Name")]
    public string ServerName { get; set; }

    [Display(Name = "Contact URL")]
    public string ContactUrl { get; set; }

    [Display(Name = "Logo")]
    [JsonIgnore]
    public IFormFile LogoFile { get; set; }

    public string LogoUrl { get; set; }
    [Display(Name = "Base URL")]
    public string BaseUrl { get; set; }
}
