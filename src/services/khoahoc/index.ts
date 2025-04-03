import { KhoaHoc } from '@/models/khoahoc';

// Service cho khóa học
export default {
	getDanhSachKhoaHoc(): KhoaHoc[] {
		const khoaHocData = localStorage.getItem('danhSachKhoaHoc');
		if (khoaHocData) {
			try {
				return JSON.parse(khoaHocData);
			} catch (e) {
				console.error('Lỗi khi parse dữ liệu khóa học:', e);
			}
		}
		return [];
	},

	addKhoaHoc(khoaHoc: KhoaHoc): boolean {
		const danhSachKhoaHoc = this.getDanhSachKhoaHoc();

		// Kiểm tra trùng tên
		const isTenKhoaHocTonTai = danhSachKhoaHoc.some((kh) => kh.tenKhoaHoc === khoaHoc.tenKhoaHoc);

		if (isTenKhoaHocTonTai) {
			return false;
		}

		// Thêm khóa học mới
		const newDanhSachKhoaHoc = [...danhSachKhoaHoc, khoaHoc];
		localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

		return true;
	},

	updateKhoaHoc(khoaHoc: KhoaHoc): boolean {
		const danhSachKhoaHoc = this.getDanhSachKhoaHoc();

		// Kiểm tra trùng tên (ngoại trừ khóa học đang cập nhật)
		const isTenKhoaHocTonTai = danhSachKhoaHoc.some(
			(kh) => kh.tenKhoaHoc === khoaHoc.tenKhoaHoc && kh.id !== khoaHoc.id,
		);

		if (isTenKhoaHocTonTai) {
			return false;
		}

		// Cập nhật khóa học
		const newDanhSachKhoaHoc = danhSachKhoaHoc.map((kh) => (kh.id === khoaHoc.id ? { ...khoaHoc } : kh));

		localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

		return true;
	},

	deleteKhoaHoc(id: string): boolean {
		const danhSachKhoaHoc = this.getDanhSachKhoaHoc();

		// Kiểm tra xem khóa học có học viên không
		const khoaHoc = danhSachKhoaHoc.find((kh) => kh.id === id);
		if (khoaHoc && khoaHoc.soLuongHocVien > 0) {
			return false;
		}

		// Xóa khóa học
		const newDanhSachKhoaHoc = danhSachKhoaHoc.filter((kh) => kh.id !== id);
		localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

		return true;
	},
};
