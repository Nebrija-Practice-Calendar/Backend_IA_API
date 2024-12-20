import { practiceModel } from "../db/practice.ts";
import { SubjectModel } from "../db/subject.ts";
import { Courses_and_GroupsModel } from "../db/courses_and_groups.ts";
import { Practice, PracticeType } from "../types.ts";

export default async function orderPractices(practices: PracticeType[]) {
    const ids = practices.map(practice => practice.id_practice);
    const practicesModel = await practiceModel.find({ _id: { $in: ids } }).exec();

    const practicesWithDetails = await Promise.all(practicesModel.map(async (practice) => {
        const practiceInfo = practices.find(p => p.id_practice === practice.id);

        if (!practiceInfo) return practice;

        const [group, subject] = await Promise.all([
            Courses_and_GroupsModel.findById(practice.id_course_and_group).exec(),
            SubjectModel.findOne({code:practice.id_subject}).exec()
        ]);

        return {
            ...practice._doc,
            groupName: group?.name || '',
            subjectName: subject?.name || '',
            practiceName: practice.name,
            duration: practiceInfo.duration
        };
    }));

    const orderedPractices = practicesWithDetails.sort((a, b) => {
        const practiceComparison = a.practiceName.localeCompare(b.practiceName);
        if (practiceComparison !== 0) return practiceComparison;

        const groupComparison = a.groupName.localeCompare(b.groupName);
        if (groupComparison !== 0) return groupComparison;

        return a.subjectName.localeCompare(b.subjectName);
    });
    const oderedPracticesOptimiced = orderedPractices.map(practice => {//Solo se devuelven los campos necesarios
        return {
            id_practice: practice._id,
            duration: practice.duration,
        };
    });
    console.log(oderedPracticesOptimiced);
    return oderedPracticesOptimiced;
}
