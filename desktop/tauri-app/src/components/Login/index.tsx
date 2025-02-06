import React, { useState, useEffect } from 'react';
import { Card, Tabs, Input, Button, message, Image } from 'antd';
import { QrcodeOutlined, KeyOutlined } from '@ant-design/icons';
import { loginWithQr, loginWithCookies, checkLoginStatus } from '@/utils/api';
import { useLoginStore } from '@/utils/store';

const Login: React.FC = () => {
  const [cookies, setCookies] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrPolling, setQrPolling] = useState<NodeJS.Timeout | null>(null);
  const { isLoggedIn, setLoggedIn } = useLoginStore();

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (qrPolling) {
        clearInterval(qrPolling);
      }
    };
  }, [qrPolling]);

  const handleQrLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithQr();
      if (result.includes('data:image') || result.startsWith('http')) {
        setQrCode(result);
        message.success('请使用115手机APP扫描二维码');
        
        // 开始轮询检查登录状态
        const timer = setInterval(async () => {
          try {
            // 这里需要添加一个新的API来检查登录状态
            const status = await checkLoginStatus();
            if (status.success) {
              clearInterval(timer);
              setQrPolling(null);
              setLoggedIn(true, 'qr');
              message.success('登录成功！');
            }
          } catch (error) {
            console.error('检查登录状态失败:', error);
          }
        }, 3000); // 每3秒检查一次
        
        setQrPolling(timer);
      }
    } catch (error) {
      message.error('获取二维码失败: ' + (error as Error).message);
      setQrCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCookieLogin = async () => {
    if (!cookies.trim()) {
      message.warning('请输入Cookie');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithCookies(cookies);
      setLoggedIn(true, 'cookie');
      message.success('登录成功');
    } catch (error) {
      message.error('登录失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 如果已经登录，显示已登录状态
  if (isLoggedIn) {
    return (
      <Card title="登录状态" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ color: '#52c41a' }}>已登录</h2>
          <Button 
            type="primary" 
            danger 
            onClick={() => useLoginStore.getState().logout()}
          >
            退出登录
          </Button>
        </div>
      </Card>
    );
  }

  const items = [
    {
      key: '1',
      label: (
        <span>
          <QrcodeOutlined /> 二维码登录
        </span>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Button 
            type="primary" 
            onClick={handleQrLogin}
            loading={loading}
          >
            获取二维码
          </Button>
          <div style={{ marginTop: '20px' }}>
            {qrCode && (
              <Image
                src={qrCode}
                alt="登录二维码"
                style={{ maxWidth: '200px' }}
                preview={false}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <KeyOutlined /> Cookie登录
        </span>
      ),
      children: (
        <div style={{ padding: '20px' }}>
          <Input.TextArea
            rows={4}
            value={cookies}
            onChange={(e) => setCookies(e.target.value)}
            placeholder="请输入Cookie"
          />
          <Button
            type="primary"
            style={{ marginTop: '10px' }}
            onClick={handleCookieLogin}
            loading={loading}
          >
            登录
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card title="115网盘登录" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default Login; 