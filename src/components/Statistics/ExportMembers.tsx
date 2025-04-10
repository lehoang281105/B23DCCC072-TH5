import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useModel } from 'umi';

interface ClubMember {
	fullName: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	createdAt: string;
	status: string;
	clubId: string;
}

interface Club {
	id: string;
	name: string;
}

const ExportMembers: React.FC = () => {
	const { exportMembersByClub } = useModel('statistics');

	const handleExport = () => {
		const clubs: Club[] = JSON.parse(localStorage.getItem('clubs') || '[]');
		const registrations: ClubMember[] = JSON.parse(localStorage.getItem('registrations') || '[]');

		// Lọc các đơn đã được duyệt và group theo CLB
		const membersByClub = clubs.reduce((acc: Record<string, any[]>, club: Club) => {
			const clubMembers = registrations.filter((r: ClubMember) => r.status === 'approved' && r.clubId === club.id);

			if (clubMembers.length > 0) {
				acc[club.name] = clubMembers.map((member: ClubMember) => ({
					'Họ tên': member.fullName,
					Email: member.email,
					SĐT: member.phone,
					'Giới tính': member.gender === 'male' ? 'Nam' : member.gender === 'female' ? 'Nữ' : 'Khác',
					'Địa chỉ': member.address,
					'Sở trường': member.skills,
					'Ngày đăng ký': new Date(member.createdAt).toLocaleDateString('vi-VN'),
				}));
			}
			return acc;
		}, {});

		// Tạo workbook với sheet cho từng CLB
		const wb = XLSX.utils.book_new();
		Object.entries(membersByClub).forEach(([clubName, members]) => {
			const ws = XLSX.utils.json_to_sheet(members as any[]);
			XLSX.utils.book_append_sheet(wb, ws, clubName);
		});

		// Xuất file
		XLSX.writeFile(wb, `danh_sach_thanh_vien_${new Date().getTime()}.xlsx`);
	};

	return (
		<Button type='primary' icon={<DownloadOutlined />} onClick={handleExport}>
			Xuất danh sách thành viên
		</Button>
	);
};

export default ExportMembers;
