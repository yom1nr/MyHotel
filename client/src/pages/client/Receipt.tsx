import { useLocation, Navigate, useNavigate } from 'react-router-dom'
import { formatCurrencyTHB, formatDateShort } from '../../utils/format'

export default function Receipt() {
    const location = useLocation()
    const navigate = useNavigate()
    const result = location.state as any

    if (!result) return <Navigate to="/booking-status" replace />

    return (
        <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0">
            <div className="mx-auto max-w-2xl bg-white p-10 shadow-xl print:shadow-none print:p-0 rounded-2xl print:rounded-none">
                {/* Hotel Header */}
                <div className="flex justify-between items-start border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">MyHotel</h1>
                        <p className="text-sm text-slate-500 mt-1">123 Hotel Avenue, City, Country</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-widest">Receipt</h2>
                        <p className="text-sm text-slate-500 mt-1">Booking ID: <span className="font-semibold text-slate-700">{result.booking_code}</span></p>
                        <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Guest & Stay Info */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billed To</h3>
                        <p className="mt-2 font-medium text-slate-800 text-lg">{result.guest_full_name}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stay Details</h3>
                        <table className="mt-2 text-sm text-slate-600 border-separate border-spacing-y-1">
                            <tbody>
                                <tr>
                                    <td className="font-medium text-slate-800 pr-4">Check-in:</td>
                                    <td>{formatDateShort(result.check_in_date)}</td>
                                </tr>
                                <tr>
                                    <td className="font-medium text-slate-800 pr-4">Check-out:</td>
                                    <td>{formatDateShort(result.check_out_date)}</td>
                                </tr>
                                <tr>
                                    <td className="font-medium text-slate-800 pr-4">Nights:</td>
                                    <td>{result.nights} คืน</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Room Details Table */}
                <div className="mt-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-y border-slate-200 text-sm font-semibold text-slate-600 bg-slate-50">
                                <th className="py-3 px-4 rounded-tl-lg rounded-bl-lg">Description</th>
                                <th className="py-3 px-4 text-center">Nights</th>
                                <th className="py-3 px-4 text-right rounded-tr-lg rounded-br-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-800">
                            <tr className="border-b border-slate-100">
                                <td className="py-5 px-4">
                                    <p className="font-semibold text-base">Room {result.room_number}</p>
                                    <p className="text-sm text-slate-500 capitalize">{result.room_type} Room</p>
                                </td>
                                <td className="py-5 px-4 text-center font-medium">{result.nights}</td>
                                <td className="py-5 px-4 text-right font-medium">{formatCurrencyTHB(Number(result.total_amount))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-8 flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600 px-4">
                            <span>Subtotal</span>
                            <span>{formatCurrencyTHB(Number(result.total_amount))}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 px-4 border-t border-slate-200">
                            <span>Total Paid</span>
                            <span className="text-indigo-600">{formatCurrencyTHB(Number(result.total_amount))}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                        กลับไปหน้าสถานะ
                    </button>
                    <button onClick={() => window.print()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
                        พิมพ์ใบเสร็จ
                    </button>
                </div>

                <div className="mt-12 text-center text-xs text-slate-400 hidden print:block">
                    <p>Thank you for choosing MyHotel. We hope you enjoyed your stay!</p>
                    <p className="mt-1">This is a computer-generated receipt.</p>
                </div>
            </div>
        </div>
    )
}
