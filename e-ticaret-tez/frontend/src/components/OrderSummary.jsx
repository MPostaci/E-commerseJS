import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";



const OrderSummary = () => {
	const [newCreditCard, setCreditCard] = useState({
			cardUserName: "",
			cardNumber: "",
			expiryDate: "",
			cvc: "",
		});
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);


	const navigate = useNavigate();

	const handlePayment = async () => {

		const res = await axios.post("/payments", {
			products: cart,
			couponCode: coupon ? coupon.code : null,
			creditCard: newCreditCard,
		});

		if (res.data.status === "success") {
			console.log(res);
            console.log(res.data.message);
            navigate('/purchase-success'); // Navigate to the success page
        } else if (res.data.status === "failure") {
            console.error(res.data.message);
            navigate('/purchase-cancel'); // Navigate to the failure page
        }

	};

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Sipariş Özeti</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Genel Tutar</dt>
						<dd className='text-base font-medium text-white'>${formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>İndirimler</dt>
							<dd className='text-base font-medium text-emerald-400'>-${formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Kupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Toplam Tutar</dt>
						<dd className='text-base font-bold text-emerald-400'>${formattedTotal}</dd>
					</dl>
				</div>
				{/* Credit card info tab */}
				
				<div>
					<input
						type='text'
                		name='name'
						placeholder="Kart Sahibinin Adı Soyadı"
						value={newCreditCard.cardUserName}
						onChange={(e) => setCreditCard({ ...newCreditCard, cardUserName: e.target.value })}
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2
						focus:ring-emerald-500 focus:border-emerald-500'
						required
					/>
				</div>
				<div>
				<input
					type='text'
					name='number'
					placeholder="Kart Numarası"
					maxLength='19'
					value={newCreditCard.cardNumber}
					onChange={(e) => {
						let formattedValue = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
						formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim(); // Insert space every 4 digits
						setCreditCard({ ...newCreditCard, cardNumber: formattedValue });
					}}
					className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
								px-3 text-white focus:outline-none focus:ring-2
								focus:ring-emerald-500 focus:border-emerald-500'
					required
				/>
				</div>
				<div className="flex space-x-4">
					<input
						type="text"
						name="expiryDate"
						placeholder="MM/YY"
						maxLength="5"
						value={newCreditCard.expiryDate}
						onChange={(e) => {
						let formattedValue = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
						if (formattedValue.length > 2) {
							formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2); // Add '/'
						}
						setCreditCard({ ...newCreditCard, expiryDate: formattedValue });
						}}
						className="block w-1/2 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
								px-3 text-white focus:outline-none focus:ring-2
								focus:ring-emerald-500 focus:border-emerald-500"
						required
					/>
					<input
						type="text"
						name="cvc"
						placeholder="CVC"
						maxLength="3"
						value={newCreditCard.cvc}
						onChange={(e) => setCreditCard({ ...newCreditCard, cvc: e.target.value.replace(/\D/g, '') })}
						className="block w-1/2 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
								px-3 text-white focus:outline-none focus:ring-2
								focus:ring-emerald-500 focus:border-emerald-500"
						required
					/>
				</div>
				

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePayment}
				>
					Ödemeyi Tamamla
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
					>
						Alışverişe Devam Et
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;