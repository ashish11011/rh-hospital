import { getCouponCodeDetails } from "@/helper/workshop/getCouponCodeDetails";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { couponCode, workshopId } = body;
        const data = await getCouponCodeDetails(couponCode, workshopId);
        return Response.json({ status: 200, data: data });
    } catch (error: any) {
        console.log(error);
        return Response.json({ status: 400, message: error.message });
    }
}