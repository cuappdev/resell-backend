import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { SubCategory, Uuid } from "../types";
import { SubCategoryGroupModel } from "./SubCategoryGroupModel";
import { PostModel } from "./PostModel";

@Entity("SubCategory")
export class SubCategoryModel {
    @PrimaryGeneratedColumn("uuid")
    id: Uuid;

    @Column()
    name: string;

    @ManyToOne(() => SubCategoryGroupModel, (group) => group.subcategories, { onDelete: "CASCADE" })
    @JoinColumn({ name: "groupId" })
    group: SubCategoryGroupModel;

    @ManyToMany(() => PostModel, (post) => post.subcategories)
    posts: PostModel[];

    public getSubCategoryInfo(): SubCategory {
        return {
            id: this.id,
            name: this.name,
            groupId: this.group?.id,
            groupName: this.group?.name,
            posts: this.posts,
        };
    }
}
