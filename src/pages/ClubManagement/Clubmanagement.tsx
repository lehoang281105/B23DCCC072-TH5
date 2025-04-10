import React, { useCallback } from 'react';
import { Modal, Table, Button, Form } from 'antd';
import useClubModel from '@/models/club';
import useMemberModel from '@/models/member';
import ClubForm from '@/components/Club/ClubForm';
import ClubList from '@/components/Club/ClubList';

const Clubmanagement: React.FC = () => {
	const {
		clubs,
		editingClub,
		isModalOpen,
		isMemberModalOpen,
		setEditingClub,
		setIsModalOpen,
		setIsMemberModalOpen,
		handleDelete,
		handleEdit,
		handleSave,
		resetState,
	} = useClubModel();

	const { selectedClubMembers, getMembersByClub } = useMemberModel();
	const [form] = Form.useForm();

	const handleViewMembers = useCallback(
		(clubId: string) => {
			getMembersByClub(clubId);
			setIsMemberModalOpen(true);
		},
		[getMembersByClub, setIsMemberModalOpen],
	);

	const handleAddNew = useCallback(() => {
		setEditingClub(null);
		setIsModalOpen(true);
	}, [setEditingClub, setIsModalOpen]);

	const handleFormSubmit = () => {
		form.submit();
	};

	return (
		<div>
			<ClubList
				clubs={clubs}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onViewMembers={handleViewMembers}
				onAdd={handleAddNew}
			/>

			<Modal
				title={editingClub ? 'Chỉnh sửa CLB' : 'Thêm CLB'}
				visible={isModalOpen}
				onCancel={() => resetState()}
				destroyOnClose
				footer={[
					<Button key='cancel' onClick={() => resetState()}>
						Hủy
					</Button>,
					<Button key='submit' type='primary' onClick={handleFormSubmit}>
						Lưu
					</Button>,
				]}
			>
				<ClubForm initialValues={editingClub || undefined} onFinish={handleSave} form={form} />
			</Modal>

			<Modal
				title='Danh sách thành viên'
				visible={isMemberModalOpen}
				onCancel={() => setIsMemberModalOpen(false)}
				footer={null}
				width={800}
			>
				<Table
					rowKey='id'
					dataSource={selectedClubMembers}
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
