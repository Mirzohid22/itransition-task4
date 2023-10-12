import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Spin, Alert } from 'antd';
import { setAdmin } from '../app/features/admin';

const Register = () => {
    const [form] = Form.useForm();
    const [clientReady, setClientReady] = useState(false);
    const history = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [status, setStatus] = useState('info')
    const [message, setMessage] = useState('All inputs are required')

    useEffect(() => {
        setClientReady(true);

    }, []);
    const onFinish = (values) => {
        const { email, password, name } = values;
        const login = async () => {
            setLoading(true)
            await axios.post("https://itransitiont4bymirzohid.onrender.com/register", { email, password, name })
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
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your name!',
                                type: 'name'
                            },
                        ]}
                        validateStatus
                        hasFeedback
                        required
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Name" />
                    </Form.Item>
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
                    >
                        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
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
                                Register
                            </Button>
                                <span style={{ paddingLeft: '10px' }}> Already have an account <a href="/login">log in</a></span></div>
                        )}
                    </Form.Item>
                    {
                        showAlert &&
                        <Form.Item shouldUpdate>
                            <Alert type={status} message={message} showIcon />
                        </Form.Item>
                    }
                </Form>
            </Spin>
        </div>
    );
};
export default Register;