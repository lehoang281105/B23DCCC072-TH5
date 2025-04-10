import { useState, useEffect } from 'react';
import useClubModel from './club';
import useMemberModel from './member';

export interface ClubStatistic {
	clubId: string;
	clubName: string;
	pending: number;
	approved: number;
	rejected: number;
}

export default () => {
	const { clubs } = useClubModel();
	const { members } = useMemberModel();
	const [statistics, setStatistics] = useState({
		totalClubs: 0,
		pendingRegistrations: 0,
		approvedRegistrations: 0,
		rejectedRegistrations: 0,
	});
	const [clubStatistics, setClubStatistics] = useState<ClubStatistic[]>([]);

	useEffect(() => {
		// Tính toán các số liệu thống kê
		const pendingCount = members.filter((m) => m.status === 'Pending').length;
		const approvedCount = members.filter((m) => m.status === 'Approved').length;
		const rejectedCount = members.filter((m) => m.status === 'Rejected').length;

		setStatistics({
			totalClubs: clubs.length,
			pendingRegistrations: pendingCount,
			approvedRegistrations: approvedCount,
			rejectedRegistrations: rejectedCount,
		});

		// Tính toán thống kê cho từng CLB
		const clubStats = clubs.map((club) => {
			const clubMembers = members.filter((member) => member.club === club.id);

			return {
				clubId: club.id,
				clubName: club.name,
				pending: clubMembers.filter((m) => m.status === 'Pending').length,
				approved: clubMembers.filter((m) => m.status === 'Approved').length,
				rejected: clubMembers.filter((m) => m.status === 'Rejected').length,
			};
		});

		setClubStatistics(clubStats);
	}, [clubs, members]);

	const exportMembersByClub = () => {
		// Logic xuất danh sách thành viên theo CLB
		// (Chức năng này sẽ được thực hiện trong component ExportMembers)
		return null;
	};

	return {
		statistics,
		clubStatistics,
		exportMembersByClub,
	};
};
