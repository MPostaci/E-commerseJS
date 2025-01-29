import { iyzipay } from "../lib/iyzico.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { v4 as uuidv4 } from 'uuid';

export const payment = async (req, res) => {
    try {
        const { products, couponCode, creditCard } = req.body;
        const user = req.user;

        if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

        let totalAmount = 0;
        let coupon = null;
        let basketItems = [];

        // Kuponu kontrol et
        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                userId: user._id,
                isActive: true
            });
        }

        // Sepet hesaplama
        basketItems = products.map((product) => {
            const amount = Math.round(product.price*100) / 100; // Ürünün yuvarlanmış fiyatı
            let discountedPrice = amount; // İndirim uygulanmamış fiyat

            // Kupon varsa indirimi uygula
            if (coupon) {
                discountedPrice = Math.round(amount * (1 - coupon.discountPercentage / 100) * 100) / 100;
            }

            // Toplam tutara ekle
            totalAmount += discountedPrice * product.quantity;

            // Ürün bilgilerini dön
            return {
                id: product._id,
                price: discountedPrice * product.quantity,
                name: product.name,
                category1: product.category,
                itemType: "PHYSICAL"
            };
        });



        console.log(totalAmount)
        console.log(basketItems)
        const convid = uuidv4();
      
        const data =  { 
        locale: "tr", 
        conversationId: convid,
        price: totalAmount,
        paidPrice: totalAmount,
        currency: "TRY",
        installment: '1',
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        paymentCard: {
            cardHolderName: creditCard.cardUserName,
            cardNumber: creditCard.cardNumber.replace(/\s+/g, ""),
            expireMonth: creditCard.expiryDate.split('/')[0],
            expireYear: 20 + creditCard.expiryDate.split('/')[1], 
            cvc: creditCard.cvc,
            registerCard: '0'
        },
        buyer: {
            id: 'BY789',
            name: 'John',
            surname: 'Doe',
            gsmNumber: '+905350000000', 
            email: 'email@email.com',
            identityNumber: '74300864791',
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        billingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        basketItems: basketItems
    }

    

    iyzipay.payment.create(data, (err, result) => {
        if (err) {
            console.error("Payment creation error:", err);
            return res.status(500).json({ 

                status: "error", 
                message: "Server error", 
                error: err.message 
            });
        }
    
        if (result.status === "failure") {
            console.error("Payment failed:", result.errorMessage || "An error occurred");
            return res.json({ 
                status: "failure", 
                message: result.errorMessage || "Payment failed" 
            });
        }
        
        const newOrder = new Order({
            user: user._id,
            products: products.map((product) => ({
                product: product._id,
                quantity: product.quantity,
                price: product.price,
            })),
            totalAmount: totalAmount,
            iyzipayConvId: convid,
        })

        
        newOrder.save();

        if (totalAmount >= 10) {
            createNewCoupon(user._id);
        }
        // Payment was successful
        // console.log("Payment successful:", result);
        return res.status(200).json({ 
            status: "success", 
            message: "Payment successful", 
            orderId: newOrder._id,
            data: result 
        });
    });
        
    } catch (error) {
        console.log("Error in payment controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}