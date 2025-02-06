import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Select, Tooltip, Switch, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, ImportOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { RssSource, readRssConfig, saveRssConfig, addRssTask } from '@/utils/api';

const SUPPORTED_SITES = [
  { label: 'Mikanani', value: 'mikanani.me' },
  { label: 'Nyaa', value: 'nyaa.si' },
  { label: 'DMHY', value: 'share.dmhy.org' },
  { label: 'ACG.RIP', value: 'acg.rip' },
];

const RssManager: React.FC = () => {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSource, setEditingSource] = useState<RssSource | null>(null);
  const [filterError, setFilterError] = useState<string>('');
  const [skipCache, setSkipCache] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const config = await readRssConfig();
      const allSources = Object.values(config).flat();
      setSources(allSources);
    } catch (error) {
      message.error('加载RSS源失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const validateFilter = (rule: any, value: string) => {
    if (!value) return Promise.resolve();
    try {
      new RegExp(value);
      setFilterError('');
      return Promise.resolve();
    } catch (e) {
      const error = '无效的正则表达式';
      setFilterError(error);
      return Promise.reject(error);
    }
  };

  const handleSave = async (values: RssSource) => {
    try {
      await addRssTask(values.url, skipCache);
      
      const newSources = editingSource 
        ? sources.map(s => s.url === editingSource.url ? values : s)
        : [...sources, values];
        
      const groupedSources = newSources.reduce((acc, source) => {
        if (!acc[source.site]) {
          acc[source.site] = [];
        }
        acc[source.site].push(source);
        return acc;
      }, {} as Record<string, RssSource[]>);

      await saveRssConfig(groupedSources);
      
      message.success(editingSource ? '更新成功' : '添加成功');
      setModalVisible(false);
      form.resetFields();
      setEditingSource(null);
      await loadSources();
    } catch (error) {
      message.error((editingSource ? '更新' : '添加') + '失败: ' + (error as Error).message);
    }
  };

  const handleDelete = async (source: RssSource) => {
    try {
      const newSources = sources.filter(s => s.url !== source.url);
      const groupedSources = newSources.reduce((acc, source) => {
        if (!acc[source.site]) {
          acc[source.site] = [];
        }
        acc[source.site].push(source);
        return acc;
      }, {} as Record<string, RssSource[]>);

      await saveRssConfig(groupedSources);
      message.success('删除成功');
      await loadSources();
    } catch (error) {
      message.error('删除失败: ' + (error as Error).message);
    }
  };

  const handleBatchImport = async (content: string) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const newSources: RssSource[] = [];
      const errors: string[] = [];

      for (const line of lines) {
        const [name, url, site, filter = '', cid = ''] = line.split(',').map(s => s.trim());
        
        if (!name || !url || !site) {
          errors.push(`无效的行: ${line}`);
          continue;
        }

        if (!SUPPORTED_SITES.find(s => s.value === site)) {
          errors.push(`不支持的站点 ${site}: ${line}`);
          continue;
        }

        try {
          await addRssTask(url, skipCache);
          newSources.push({ name, url, site, filter, cid });
        } catch (error) {
          errors.push(`添加任务失败 ${url}: ${(error as Error).message}`);
        }
      }

      if (newSources.length > 0) {
        const allSources = [...sources, ...newSources];
        const groupedSources = allSources.reduce((acc, source) => {
          if (!acc[source.site]) {
            acc[source.site] = [];
          }
          acc[source.site].push(source);
          return acc;
        }, {} as Record<string, RssSource[]>);

        await saveRssConfig(groupedSources);
        await loadSources();
        message.success(`成功导入 ${newSources.length} 个RSS源`);
      }

      if (errors.length > 0) {
        Modal.error({
          title: '部分RSS源导入失败',
          content: (
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          ),
        });
      }
    } catch (error) {
      message.error('批量导入失败: ' + (error as Error).message);
    }
  };

  const handleExecute = async (source: RssSource) => {
    try {
      setLoading(true);
      await addRssTask(source.url, skipCache);
      message.success('执行成功');
    } catch (error) {
      message.error('执行失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '站点',
      dataIndex: 'site',
      key: 'site',
      render: (site: string) => SUPPORTED_SITES.find(s => s.value === site)?.label || site,
    },
    {
      title: '过滤规则',
      dataIndex: 'filter',
      key: 'filter',
      ellipsis: true,
      render: (filter: string) => (
        <Tooltip title={filter}>
          <span>{filter || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '目标文件夹',
      dataIndex: 'cid',
      key: 'cid',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RssSource) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSource(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Tooltip title="立即执行">
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(record)}
            />
          </Tooltip>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSource(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          添加RSS源
        </Button>
        <Upload
          accept=".csv,.txt"
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                handleBatchImport(e.target.result as string);
              }
            };
            reader.readAsText(file);
            return false;
          }}
        >
          <Button icon={<ImportOutlined />}>批量导入</Button>
        </Upload>
        <Tooltip title="跳过检查数据库缓存">
          <Switch
            checkedChildren="跳过缓存"
            unCheckedChildren="使用缓存"
            checked={skipCache}
            onChange={setSkipCache}
          />
        </Tooltip>
      </Space>

      <Table
        columns={columns}
        dataSource={sources}
        rowKey="url"
        loading={loading}
      />

      <Modal
        title={editingSource ? '编辑RSS源' : '添加RSS源'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSource(null);
          setFilterError('');
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: '请输入URL' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="site"
            label="站点"
            rules={[{ required: true, message: '请选择站点' }]}
          >
            <Select
              options={SUPPORTED_SITES}
              placeholder="请选择站点"
            />
          </Form.Item>
          <Form.Item
            name="filter"
            label={
              <Space>
                过滤规则
                <Tooltip title="支持正则表达式，例如: .*1080p.* 表示标题中包含1080p的内容">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            validateStatus={filterError ? 'error' : ''}
            help={filterError}
            rules={[{ validator: validateFilter }]}
          >
            <Input placeholder="例如: .*1080p.*" />
          </Form.Item>
          <Form.Item
            name="cid"
            label={
              <Space>
                目标文件夹
                <Tooltip title="115网盘文件夹的CID，可以从文件夹URL中获取">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Input placeholder="例如: 1234567" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RssManager; 