package com.example.web.config;

import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Jackson 序列化/反序列化配置类
 * 
 * 用于统一处理项目中 LocalDateTime 类型的日期格式转换
 * 解决前端传递的日期字符串格式（yyyy-MM-dd HH:mm:ss）与后端解析不匹配的问题
 */
@Configuration
public class JacksonConfig {

    /**
     * 统一的日期时间格式模式
     * 格式：年-月-日 时:分:秒（例如：2026-05-27 14:12:00）
     */
    private static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /**
     * 自定义 Jackson ObjectMapper 的配置
     * 
     * 通过此配置，Spring Boot 会自动使用指定的格式化器来处理所有
     * LocalDateTime 类型的序列化和反序列化操作
     * 
     * @return Jackson2ObjectMapperBuilderCustomizer 定制器
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {

        return builder -> {

            // 创建日期时间格式化器，使用统一的格式模式
            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);

            // 配置 LocalDateTime 的序列化器（Java对象 -> JSON字符串）
            // 当后端返回包含LocalDateTime的对象时，会按照指定格式转换为字符串
            builder.serializerByType(
                    LocalDateTime.class,
                    new LocalDateTimeSerializer(formatter)
            );

            // 配置 LocalDateTime 的反序列化器（JSON字符串 -> Java对象）
            // 当前端传递日期字符串时，会按照指定格式解析为LocalDateTime对象
            // 这样就解决了 "2026-05-27 14:12:00" 格式的解析错误
            builder.deserializerByType(
                    LocalDateTime.class,
                    new LocalDateTimeDeserializer(formatter)
            );
        };
    }
}