import { practiceModel } from "../db/practice.ts";
import { PracticeType } from "../types.ts";

export default async function checkList(order_Practices: PracticeType[]):Promise<PracticeType[]> {
    const ids = order_Practices.map(practice => practice.id_practice);
    const practicesModel = await practiceModel.find({ _id: { $in: ids } }).exec();

    const filteredPractices = practicesModel.filter((practice, index, self) => {
        const similarPractice = self.find(p =>
            p.id_course_and_group === practice.id_course_and_group &&
            p.name.startsWith(practice.name.replace(/\d+$/, "")) &&
            parseInt(p.name.replace(/\D/g, '')) === parseInt(practice.name.replace(/\D/g, '')) + 1
        );

        return !similarPractice;
    });

    const remainingIds = new Set(filteredPractices.map(practice => practice._id.toString()));

    const result = order_Practices
        .filter(practice => remainingIds.has(practice.id_practice.toString()))
        .map(practice => ({
            id_practice: practice.id_practice,
            duration: practice.duration
        }));
    return result;
}
