package com.digitallanka.institutionalprovisioning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret = "dGhpcy1pcy1hLXNlY3VyZS1hbmQtc3VwZXItc2VjcmV0LWtleS1mb3Itand0LWdlbmVyYXRpb24tMjU2LWJpdHM=";
    private long expiration = 86400000; // 24 hours

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
}
