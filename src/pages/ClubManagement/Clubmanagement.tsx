import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Popconfirm, Switch, Upload, Modal, Form } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TinyEditor from '@/components/TinyEditor';
import type { UploadChangeParam } from 'antd/es/upload';

interface Club {
	id: string;
	avatar: string;
	name: string;
	description: string;
	chuNhiem: string;
	active: boolean;
}

interface Member {
	id: string;
	name: string;
	email: string;
	phone: string;
	gender: string;
	club: string;
	status: string;
}

const Clubmanagement: React.FC = () => {
	const [clubs, setClubs] = useState<Club[]>([]);
	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); // Quản lý trạng thái modal
	const [selectedClubMembers, setSelectedClubMembers] = useState<Member[]>([]); // Lưu danh sách thành viên của CLB
	const [editingClub, setEditingClub] = useState<Club | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const [refresh, setRefresh] = useState(false); // Trạng thái để làm mới dữ liệu

	const fetchClubs = () => {
		fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb')
			.then((res) => res.json())
			.then((data) => setClubs(data))
			.catch((err) => console.error('Error fetching clubs:', err));
	};

	const fetchMembersByClub = (clubName: string) => {
		fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students')
			.then((res) => res.json())
			.then((data) => {
				const members = data.filter((member: Member) => member.club === clubName && member.status === 'Approved');
				setSelectedClubMembers(members); // Lưu danh sách thành viên
				setIsMemberModalOpen(true); // Hiển thị modal
			})
			.catch((err) => console.error('Error fetching members:', err));
	};

	useEffect(() => {
		fetchClubs();
	}, [refresh]); // Lắng nghe trạng thái refresh

	const handleDelete = (id: string) => {
		fetch(`https://67f72b6542d6c71cca643b99.mockapi.io/Clb/${id}`, {
			method: 'DELETE',
		})
			.then(() => setClubs((prev) => prev.filter((c) => c.id !== id)))
			.catch((err) => console.error('Error deleting club:', err));
	};

	const handleEdit = (club: Club) => {
		setEditingClub(club);
		form.setFieldsValue(club);
		setIsModalOpen(true);
	};

	const handleSave = async (values: any) => {
		try {
			if (editingClub) {
				// Chỉnh sửa CLB
				const response = await fetch(`https://67f72b6542d6c71cca643b99.mockapi.io/Clb/${editingClub.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(values),
				});
				await response.json();
			} else {
				// Thêm CLB mới
				const response = await fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(values),
				});
				await response.json();
			}
			setRefresh((prev) => !prev); // Làm mới dữ liệu
			form.resetFields();
			setEditingClub(null);
			setIsModalOpen(false);
		} catch (error) {
			console.error('Error saving club:', error);
		}
	};

	const getBase64 = (file: File | Blob): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});

	const columns: ColumnsType<Club> = [
		{
			title: 'Tên CLB',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder='Tìm tên CLB'
						value={selectedKeys[0]}
						onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={() => confirm()}
						style={{ marginBottom: 8, display: 'block' }}
					/>
					<Space>
						<Button type='primary' onClick={() => confirm()} size='small' style={{ width: 90 }}>
							Tìm kiếm
						</Button>
						<Button onClick={() => clearFilters && clearFilters()} size='small' style={{ width: 90 }}>
							Xóa
						</Button>
					</Space>
				</div>
			),
			onFilter: (value, record) => record.name.toLowerCase().includes((value as string).toLowerCase()),
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			render: (html) => <div dangerouslySetInnerHTML={{ __html: html }} />,
		},
		{
			title: 'Chủ nhiệm',
			dataIndex: 'chuNhiem',
		},
		{
			title: 'Hoạt động',
			dataIndex: 'active',
			render: (active) => <Switch checked={active} disabled />,
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Space>
					<Button
						icon={<EyeOutlined />}
						onClick={() => fetchMembersByClub(record.name)} // Lấy danh sách thành viên của CLB
					>
						Xem danh sách thành viên
					</Button>
					<Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					<Popconfirm title='Xóa CLB?' onConfirm={() => handleDelete(record.id)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button type='primary' icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
				Thêm CLB
			</Button>
			<Table rowKey='id' dataSource={clubs} columns={columns} />

			<Modal
				title={editingClub ? 'Chỉnh sửa CLB' : 'Thêm CLB'}
				visible={isModalOpen}
				onCancel={() => {
					form.resetFields();
					setEditingClub(null);
					setIsModalOpen(false);
				}}
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={handleSave}>
					<Form.Item
						name='avatar'
						label='Ảnh đại diện'
						rules={[{ required: true, message: 'Vui lòng chọn ảnh đại diện' }]}
					>
						<Upload
							beforeUpload={() => false}
							maxCount={1}
							onChange={async (info: UploadChangeParam) => {
								const file = info.file.originFileObj;
								if (file) {
									try {
										const base64 = await getBase64(file);
										form.setFieldsValue({ avatar: base64 });
									} catch (error) {
										console.error('Error converting file to Base64:', error);
									}
								}
							}}
						>
							<Button icon={<UploadOutlined />}>Tải ảnh</Button>
						</Upload>
					</Form.Item>
					<Form.Item name='name' label='Tên CLB' rules={[{ required: true, message: 'Vui lòng nhập tên CLB' }]}>
						<Input />
					</Form.Item>
					<Form.Item name='description' label='Mô tả'>
						<TinyEditor />
					</Form.Item>
					<Form.Item name='chuNhiem' label='Chủ nhiệm CLB'>
						<Input />
					</Form.Item>
					<Form.Item name='active' label='Hoạt động' valuePropName='checked'>
						<Switch />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Danh sách thành viên'
				visible={isMemberModalOpen}
				onCancel={() => setIsMemberModalOpen(false)}
				footer={null} // Không cần nút footer
			>
				<Table
					rowKey='id'
					dataSource={selectedClubMembers} // Dữ liệu là danh sách thành viên của CLB
					columns={[
						{ title: 'Họ tên', dataIndex: 'name' },
						{ title: 'Email', dataIndex: 'email' },
						{ title: 'SĐT', dataIndex: 'phone' },
						{ title: 'Giới tính', dataIndex: 'gender', render: (gender) => (gender === 'Male' ? 'Nam' : 'Nữ') },
					]}
				/>
			</Modal>
		</div>
	);
};

export default Clubmanagement;
