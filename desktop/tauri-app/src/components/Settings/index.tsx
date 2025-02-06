import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { SiteConfig, readSiteConfig, saveSiteConfig } from '@/utils/api';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const config = await readSiteConfig();
      // 转换配置格式以适应表单
      const formValues = Object.entries(config).reduce((acc, [site, settings]) => {
        acc[`${site}_proxy`] = settings.httpsAgent;
        if (settings.headers) {
          Object.entries(settings.headers).forEach(([key, value]) => {
            acc[`${site}_header_${key}`] = value;
          });
        }
        return acc;
      }, {} as Record<string, string | undefined>);
      
      form.setFieldsValue(formValues);
    } catch (error) {
      message.error('加载配置失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: Record<string, string>) => {
    try {
      setLoading(true);
      
      // 将表单值转换回配置格式
      const config: SiteConfig = {};
      Object.entries(values).forEach(([key, value]) => {
        if (!value) return;
        
        const [site, type, ...rest] = key.split('_');
        if (!config[site]) {
          config[site] = {};
        }
        
        if (type === 'proxy') {
          config[site].httpsAgent = value;
        } else if (type === 'header') {
          if (!config[site].headers) {
            config[site].headers = {};
          }
          const headerKey = rest.join('_');
          config[site].headers[headerKey] = value;
        }
      });

      await saveSiteConfig(config);
      message.success('保存配置成功');
    } catch (error) {
      message.error('保存配置失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="站点配置">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* Mikanani 设置 */}
        <Card type="inner" title="Mikanani (mikanani.me)" style={{ marginBottom: 16 }}>
          <Form.Item
            label="代理服务器"
            name="mikanani.me_proxy"
            tooltip="代理服务器地址，例如：http://127.0.0.1:1080"
          >
            <Input placeholder="请输入代理服务器地址" />
          </Form.Item>
        </Card>

        {/* Nyaa 设置 */}
        <Card type="inner" title="Nyaa (nyaa.si)" style={{ marginBottom: 16 }}>
          <Form.Item
            label="代理服务器"
            name="nyaa.si_proxy"
            tooltip="代理服务器地址，例如：http://127.0.0.1:1080"
          >
            <Input placeholder="请输入代理服务器地址" />
          </Form.Item>
        </Card>

        {/* DMHY 设置 */}
        <Card type="inner" title="DMHY (share.dmhy.org)" style={{ marginBottom: 16 }}>
          <Form.Item
            label="代理服务器"
            name="share.dmhy.org_proxy"
            tooltip="代理服务器地址，例如：http://127.0.0.1:1080"
          >
            <Input placeholder="请输入代理服务器地址" />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存配置
            </Button>
            <Button onClick={loadConfig} loading={loading}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Settings; 