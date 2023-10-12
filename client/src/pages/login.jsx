import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Spin, Alert } from 'antd';
import { setAdmin } from '../app/features/admin';

const Login = () => {
    const [form] = Form.useForm();
    const [clientReady, setClientReady] = useState(false);
    const history = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [status, setStatus] = useState('info')
    const [message, setMessage] = useState('')

    useEffect(() => {
        setClientReady(true);
    }, []);

    const onFinish = (values) => {
        const { email, password } = values;
        const login = async () => {
            setLoading(true)
            await axios.post("https://itransitiont4bymirzohid.onrender.com/login", { email, password })
                .then(res => {
                    const { status, user } = res.data
                    if (status === 'success') {
                        setShowAlert(false)
                        dispatch(setAdmin(user))
                        history('/')
                    }
                })
                .catch(err => {
                    const res = err?.response
                    setShowAlert(true)
                    setStatus(res?.data?.status)
                    setMessage(res?.data?.message)
                })
                .finally(() => setLoading(false))
        }

        login()
    };
    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin spinning={loading} >
                <Form style={{ maxWidth: '400px', margin: 'auto' }} form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!',
                                type: 'email'
                            },
                        ]}
                        validateStatus
                        hasFeedback
                        required
                        help=""
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item shouldUpdate required>
                        {() => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button
                                type="primary"
                                htmlType="submit"
                                disabled={
                                    !clientReady ||
                                    !form.isFieldsTouched(true) ||
                                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                                }
                            >
                                Log in
                            </Button>
                                <span style={{ paddingLeft: '10px' }}> Don't have an account <a href="/register">register now!</a></span></div>
                        )}
                    </Form.Item>
                    {
                        showAlert &&
                        <Form.Item shouldUpdate>
                            <Alert style={{maxWidth: '300px'}} type={status} message={message} showIcon />
                        </Form.Item>
                    }
                </Form>
            </Spin>
        </div>
    );
};
export default Login;