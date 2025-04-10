import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from 'antd';
import useMemberModel from '@/models/member';
import useClubModel from '@/models/club';
import MemberForm from '@/components/Member/MemberForm';
import MemberList from '@/components/Member/MemberList';

const MemberApplications: React.FC = () => {
	const {
		members,
		selectedRows,
		isModalOpen,
		isViewMode,
		editingMember,
		setMembers,
		setSelectedRows,
		setIsModalOpen,
		setIsViewMode,
		setEditingMember,
		handleApprove,
		handleReject,
		handleDelete,
		handleSave,
		resetState,
		handleViewDetails,
		handleEdit,
	} = useMemberModel();

	const { clubs } = useClubModel();

	// Convert clubs to a Record for mapping clubId to club name
	const clubNames = clubs.reduce((acc, club) => {
		acc[club.id] = club.name;
		return acc;
	}, {} as Record<string, string>);

	const handleAddNew = () => {
		setEditingMember(null);
		setIsViewMode(false);
		setIsModalOpen(true);
	};

	const handleSelectChange = (selectedRowKeys: React.Key[]) => {
		setSelectedRows(selectedRowKeys as string[]);
	};

	const handleBulkApprove = () => {
		selectedRows.forEach((id) => handleApprove(id));
		setSelectedRows([]);
	};

	const handleBulkDelete = () => {
		const approvedMembers = selectedRows.filter((id) => {
			const member = members.find((app) => app.id === id);
			return member?.status === 'Approved';
		});

		const deletableMembers = selectedRows.filter((id) => {
			const member = members.find((app) => app.id === id);
			return member?.status !== 'Approved';
		});

		if (approvedMembers.length > 0) {
			setMembers((prev) => prev.filter((member) => !approvedMembers.includes(member.id)));
		}

		if (deletableMembers.length > 0) {
			deletableMembers.forEach((id) => handleDelete(id));
		}

		setSelectedRows([]);
	};

	const showRejectModal = (id: string) => {
		let rejectNote = '';

		Modal.confirm({
			title: 'Từ chối đơn đăng ký',
			content: (
				<Input.TextArea
					placeholder='Nhập lý do từ chối'
					onChange={(e) => {
						rejectNote = e.target.value;
					}}
					rows={4}
				/>
			),
			okText: 'Từ chối',
			cancelText: 'Hủy',
			onOk: () => {
				if (rejectNote.trim()) {
					handleReject(id, rejectNote);
					return Promise.resolve();
				} else {
					return Promise.reject('Vui lòng nhập lý do từ chối trước khi xác nhận!');
				}
			},
		});
	};

	const handleBulkReject = () => {
		let rejectNote = '';

		Modal.confirm({
			title: 'Từ chối các đơn đăng ký đã chọn',
			content: (
				<Input.TextArea
					placeholder='Nhập lý do từ chối'
					onChange={(e) => {
						rejectNote = e.target.value;
					}}
					rows={4}
				/>
			),
			okText: 'Từ chối',
			cancelText: 'Hủy',
			onOk: () => {
				if (rejectNote.trim()) {
					selectedRows.forEach((id) => {
						handleReject(id, rejectNote);
					});
					setSelectedRows([]);
					return Promise.resolve();
				} else {
					return Promise.reject('Vui lòng nhập lý do từ chối trước khi xác nhận!');
				}
			},
		});
	};

	const showHistory = (history?: string[] | string) => {
		const historyArray = Array.isArray(history) ? history : history ? [history] : [];
		Modal.info({
			title: 'Lịch sử thao tác',
			content: (
				<ul>
					{historyArray.length > 0 ? (
						historyArray.map((entry, index) => <li key={index}>{entry}</li>)
					) : (
						<p>Không có lịch sử</p>
					)}
				</ul>
			),
			onOk: () => {},
		});
	};

	return (
		<div>
			<MemberList
				members={members}
				clubNames={clubNames}
				selectedRows={selectedRows}
				onSelectChange={handleSelectChange}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onApprove={handleApprove}
				onReject={showRejectModal}
				onViewDetails={handleViewDetails}
				onViewHistory={showHistory}
				onAdd={handleAddNew}
				onBulkApprove={handleBulkApprove}
				onBulkReject={handleBulkReject}
				onBulkDelete={handleBulkDelete}
			>
				<Button type='primary' onClick={handleBulkApprove} disabled={!selectedRows.length} style={{ marginRight: 8 }}>
					Duyệt {selectedRows.length} đơn đã chọn
				</Button>
				<Button danger onClick={handleBulkReject} disabled={!selectedRows.length} style={{ marginRight: 8 }}>
					Từ chối {selectedRows.length} đơn đã chọn
				</Button>
			</MemberList>

			<Modal
				title={
					isViewMode ? 'Xem chi tiết đơn đăng ký' : editingMember ? 'Chỉnh sửa đơn đăng ký' : 'Thêm mới đơn đăng ký'
				}
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() =>
					!isViewMode && document.getElementById('member-form')?.dispatchEvent(new Event('submit', { bubbles: true }))
				}
				okButtonProps={{ disabled: isViewMode }}
			>
				<div id='member-form'>
					<MemberForm initialValues={editingMember || undefined} onFinish={handleSave} isViewMode={isViewMode} />
				</div>
			</Modal>
		</div>
	);
};

export default MemberApplications;
