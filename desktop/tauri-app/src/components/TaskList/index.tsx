import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Tag, Tooltip, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, ReloadOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { clearTasks, getTasks, Task } from '@/utils/api';

const TaskList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const taskList = await getTasks();
      setTasks(taskList);
    } catch (error) {
      message.error('加载任务列表失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    // 设置定时刷新
    const timer = setInterval(loadTasks, 5000);
    return () => clearInterval(timer);
  }, [loadTasks]);

  const handleClearTasks = async (type: number) => {
    try {
      setLoading(true);
      await clearTasks(type);
      message.success('清理任务成功');
      await loadTasks();
    } catch (error) {
      message.error('清理任务失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      running: { color: 'processing', icon: <SyncOutlined spin />, text: '运行中' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
      failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { color: 'default', icon: null, text: status };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<Task> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <Tooltip title={name}>
          <span>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '运行中', value: 'running' },
        { text: '已完成', value: 'completed' },
        { text: '失败', value: 'failed' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress: number) => (
        <Tag color={progress === 100 ? 'success' : 'processing'}>
          {progress}%
        </Tag>
      ),
      sorter: (a, b) => a.progress - b.progress,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Popconfirm
          title="确定要清理已完成的任务吗？"
          onConfirm={() => handleClearTasks(0)}
          okText="确定"
          cancelText="取消"
        >
          <Button loading={loading}>
            清理已完成
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定要清理失败的任务吗？"
          onConfirm={() => handleClearTasks(1)}
          okText="确定"
          cancelText="取消"
        >
          <Button loading={loading}>
            清理失败
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定要清理运行中的任务吗？"
          onConfirm={() => handleClearTasks(2)}
          okText="确定"
          cancelText="取消"
        >
          <Button loading={loading}>
            清理运行中
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定要清理所有任务吗？"
          onConfirm={() => handleClearTasks(3)}
          okText="确定"
          cancelText="取消"
        >
          <Button danger loading={loading}>
            清理所有
          </Button>
        </Popconfirm>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadTasks}
          loading={loading}
        >
          刷新
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个任务`,
        }}
      />
    </div>
  );
};

export default TaskList; 