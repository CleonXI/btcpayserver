using System.Threading.Tasks;
using BTCPayServer.Abstractions.Extensions;
using BTCPayServer.Data;
using BTCPayServer.Services;
using Microsoft.AspNetCore.Http;

namespace BTCPayServer.Models;

public class StoreBrandingViewModel
{
    public string LogoUrl { get; set; }

    public StoreBrandingViewModel()
    {
    }
    public static async Task<StoreBrandingViewModel> CreateAsync(HttpRequest request, UriResolver uriResolver, StoreBlob storeBlob)
    {
        if (storeBlob == null)
            return new StoreBrandingViewModel();
        return new StoreBrandingViewModel
        {
            LogoUrl = await uriResolver.Resolve(request.GetAbsoluteRootUri(), storeBlob.LogoUrl)
        };
    }
}
