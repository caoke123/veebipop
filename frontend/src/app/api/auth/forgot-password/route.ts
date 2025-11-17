import { NextRequest, NextResponse } from 'next/server';

// Mock database - using a module-level object to persist data
const mockUsers: Record<string, any> = (globalThis as any).mockUsers || {};

// Initialize the mockUsers if it doesn't exist
if (!(globalThis as any).mockUsers) {
  ;(globalThis as any).mockUsers = mockUsers;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: '邮箱地址是必需的' },
        { status: 400 }
      );
    }

    // 验证邮箱是否存在于我们的用户数据库中
    const user = mockUsers[email];
    console.log('Current users in database:', Object.keys(mockUsers));
    console.log('Attempting password reset for email:', email);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      // 为了安全，即使用户不存在也返回成功消息
      return NextResponse.json(
        { message: '如果该邮箱地址存在于我们的系统中，您将收到一封密码重置邮件。' },
        { status: 200 }
      );
    }

    // 在实际应用中，这里会发送密码重置邮件
    // 由于这是一个演示应用，我们只是模拟这个过程
    console.log(`密码重置链接已发送到: ${email}`);
    
    return NextResponse.json(
      { message: '如果该邮箱地址存在于我们的系统中，您将收到一封密码重置邮件。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('忘记密码请求错误:', error);
    return NextResponse.json(
      { message: '处理请求时出错，请稍后再试。' },
      { status: 500 }
    );
  }
}