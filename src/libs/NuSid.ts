import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { env } from "@env/server.mjs";

export interface NuSidProfile {
  id: string;
  name: string;
  email: string;
}

export default function NuSidProvider<P extends Record<string, any> = NuSidProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  const nuIdBaseUrl = env.NUID_API_URL.split("/").slice(0, 3).join("/");
  return {
    id: "nu.id",
    name: "NU.ID",
    version: "2.0",
    type: "oauth",
    authorization: {
      url: `${env.NUID_API_URL}/oauth/authorize`,
      params: {
        scope: "basic_info",
        // redirect_uri: `${env.NEXTAUTH_URL}/api/oauth_callback`,
        response_type: "code",
      },
    },
    token: {
      url: `${env.NUID_API_URL}/oauth/token`,
      // TODO: Remove this
      async request({ client, params, checks, provider }) {
        console.log("🚀 ~ file: NuSid.ts:31 ~ request ~ client", client)
        console.log("🚀 ~ file: NuSid.ts:31 ~ request ~ options", options)
        const response = await client.oauthCallback(
          provider.callbackUrl,
          params,
          checks,
          {
            exchangeBody: {
              client_id: options.clientId,
              client_secret: options.clientSecret,
            },
          }
        );
        console.log("🚀 ~ file: NuSid.ts:41 ~ request ~ response", response)
        return { tokens: response };
      },
    },
    userinfo: {
      url: `${env.NUID_API_URL}/v1/user/me`,
      params: { "user.fields": "profile_image_url" },
    },
    profile(data) {
      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
      };
    },
    checks: ["state"],
    style: {
      logo: `https://nu.id/img/next-auth-provider-logo.svg`,
      logoDark: `https://nu.id/img/next-auth-provider-logo.svg`,
      bg: "#fff",
      text: "#1da1f2",
      bgDark: "#fff",
      textDark: "#555",
    },
    options,
  };
}

