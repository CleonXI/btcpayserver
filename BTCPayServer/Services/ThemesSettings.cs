using BTCPayServer.JsonConverters;
using Newtonsoft.Json;

namespace BTCPayServer.Services;

public class ThemeSettings
{
    [JsonConverter(typeof(UnresolvedUriJsonConverter))]
    public UnresolvedUri LogoUrl { get; set; }

    public bool FirstRun { get; set; } = true;
}
