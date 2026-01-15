-- 创建系统配置表
begin;

-- 检查系统配置表是否已存在
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_configs') THEN
        -- 创建系统配置表
        CREATE TABLE public.system_configs (
            id UUID NOT NULL DEFAULT gen_random_uuid(),
            config_key TEXT NOT NULL,
            config_value TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            CONSTRAINT system_configs_pkey PRIMARY KEY (id),
            CONSTRAINT system_configs_config_key_key UNIQUE (config_key)
        ) TABLESPACE pg_default;

        -- 创建更新时间触发器
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

        -- 为system_configs表添加更新时间触发器
        CREATE TRIGGER update_system_configs_updated_at
        BEFORE UPDATE ON public.system_configs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- 插入初始系统配置数据
        INSERT INTO public.system_configs (config_key, config_value)
        VALUES 
            ('system_name', '食堂管理系统'),
            ('system_version', '1.0.0'),
            ('default_pagination_size', '10'),
            ('max_file_size', '5242880'),
            ('allowed_file_types', 'image/jpeg,image/png,image/gif')
        ON CONFLICT (config_key) DO NOTHING;

        RAISE NOTICE 'system_configs table created successfully';
    ELSE
        RAISE NOTICE 'system_configs table already exists';
    END IF;
END $$;

commit;