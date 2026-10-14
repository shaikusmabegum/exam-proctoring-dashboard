package com.drishti.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI drishtiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DRISHTI API - Examination & Remote Proctoring Platform")
                        .description("REST API documentation for DRISHTI backend services, authentication, and proctoring foundation.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("DRISHTI Engineering Team")
                                .email("support@drishti-platform.local"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://drishti-platform.local/license")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token to authorize requests. Format: Bearer <token>")));
    }
}
