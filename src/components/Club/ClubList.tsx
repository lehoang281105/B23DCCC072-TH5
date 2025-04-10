import React from 'react';
import { Table, Button, Space, Popconfirm, Switch, Input, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ClubData } from '@/models/club';

interface ClubListProps {
	clubs: ClubData[];
	onEdit: (club: ClubData) => void;
	onDelete: (id: string) => void;
	onViewMembers: (id: string) => void;
	onAdd: () => void;
}

const ClubList: React.FC<ClubListProps> = ({ clubs, onEdit, onDelete, onViewMembers, onAdd }) => {
	const columns: ColumnsType<ClubData> = [
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar',
			width: 120,
			render: (avatar) => (
				<Avatar size={80} src={avatar} shape='square' style={{ objectFit: 'cover' }} icon={<PlusOutlined />} />
			),
		},
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
			onFilter: (value: any, record: ClubData) => record.name.toLowerCase().includes((value as string).toLowerCase()),
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
					<Button icon={<EyeOutlined />} onClick={() => onViewMembers(record.id)}>
						Xem danh sách thành viên
					</Button>
					<Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
					<Popconfirm title='Xóa CLB?' onConfirm={() => onDelete(record.id)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button type='primary' icon={<PlusOutlined />} onClick={onAdd} style={{ marginBottom: 16 }}>
				Thêm CLB
			</Button>
			<Table rowKey='id' dataSource={clubs} columns={columns} />
		</div>
	);
};

export default ClubList;
