import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button } from 'antd';
import { ClubData } from '@/models/club';
import { MemberData } from '@/models/member';
import { getClubs } from '@/services/club';

interface MemberFormProps {
	initialValues?: Partial<MemberData>;
	onFinish: (values: any) => void;
	isViewMode?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({ initialValues, onFinish, isViewMode = false }) => {
	const [form] = Form.useForm();
	const [clubs, setClubs] = useState<ClubData[]>([]);

	useEffect(() => {
		const fetchClubs = async () => {
			try {
				const data = await getClubs();
				setClubs(data);
			} catch (error) {
				console.error('Error fetching clubs:', error);
			}
		};

		fetchClubs();
	}, []);

	if (initialValues) {
		form.setFieldsValue(initialValues);
	}

	return (
		<Form form={form} layout='vertical' onFinish={onFinish}>
			<Form.Item name='name' label='Họ tên' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='email' label='Email' rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='phone' label='SĐT' rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
				<Select disabled={isViewMode}>
					<Select.Option value='Male'>Nam</Select.Option>
					<Select.Option value='Female'>Nữ</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item name='address' label='Địa chỉ'>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='skills' label='Sở trường'>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='club' label='Câu lạc bộ' rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}>
				<Select disabled={isViewMode}>
					{clubs.map((club) => (
						<Select.Option key={club.id} value={club.id}>
							{club.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name='reason' label='Lý do đăng ký'>
				<Input.TextArea disabled={isViewMode} />
			</Form.Item>
		</Form>
	);
};

export default MemberForm;
