import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Uuid } from "../types";
import { CategoryModel } from "./CategoryModel";
import { SubCategoryModel } from "./SubCategoryModel";

@Entity("SubCategoryGroup")
export class SubCategoryGroupModel {
    @PrimaryGeneratedColumn("uuid")
    id: Uuid;

    @Column()
    name: string;

    @ManyToOne(() => CategoryModel, (category) => category.subcategoryGroups, { onDelete: "CASCADE" })
    @JoinColumn({ name: "categoryId" })
    category: CategoryModel;

    @OneToMany(() => SubCategoryModel, (subcategory) => subcategory.group, { cascade: true })
    subcategories: SubCategoryModel[];
}
