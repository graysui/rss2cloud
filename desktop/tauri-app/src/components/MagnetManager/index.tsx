import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addMagnet } from '@/utils/api';

const { TextArea } = Input;

const MagnetManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { magnet: string; cid: string }) => {
    if (!values.magnet.trim()) {
      message.warning('请输入磁力链接');
      return;
    }

    try {
      setLoading(true);
      await addMagnet(values.magnet, values.cid || '');
      message.success('添加任务成功');
      form.resetFields(['magnet']);
    } catch (error) {
      message.error('添加任务失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchImport = async (content: string, cid: string) => {
    const links = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('magnet:?'));

    if (links.length === 0) {
      message.warning('未找到有效的磁力链接');
      return;
    }

    setLoading(true);
    const errors: string[] = [];
    let successCount = 0;

    for (const link of links) {
      try {
        await addMagnet(link, cid);
        successCount++;
      } catch (error) {
        errors.push(`${link}: ${(error as Error).message}`);
      }
    }

    setLoading(false);

    if (successCount > 0) {
      message.success(`成功添加 ${successCount} 个任务`);
    }

    if (errors.length > 0) {
      message.error(
        <div>
          <div>以下任务添加失败：</div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <Card title="磁力链接管理">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="目标文件夹"
          name="cid"
          tooltip="115网盘文件夹的CID，可以从文件夹URL中获取"
        >
          <Input placeholder="请输入文件夹CID（可选）" />
        </Form.Item>

        <Form.Item
          label="磁力链接"
          name="magnet"
          tooltip="支持单个磁力链接或批量导入"
        >
          <TextArea
            rows={4}
            placeholder="请输入磁力链接，每行一个"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              添加任务
            </Button>
            <Upload
              accept=".txt"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    handleBatchImport(
                      e.target.result as string,
                      form.getFieldValue('cid') || ''
                    );
                  }
                };
                reader.readAsText(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                从文件导入
              </Button>
            </Upload>
            <Button
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              清空
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MagnetManager; 