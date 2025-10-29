import { AbstractRepository, EntityRepository } from 'typeorm';

import { EventTagModel } from '../models/EventTagModel';

@EntityRepository(EventTagModel)
export class EventTagRepository extends AbstractRepository<EventTagModel> {
  public async findByIds(ids: string[]): Promise<EventTagModel[]> {
    return await this.repository
      .createQueryBuilder("eventTag")
      .where("eventTag.id IN (:...ids)", { ids })
      .getMany();
  }


  public async findOrCreateByNames(names: string[]): Promise<EventTagModel[]> {
    const existing = await this.repository
      .createQueryBuilder("eventTag")
      .where("eventTag.name IN (:...names)", { names })
      .getMany();

    const existingNames = new Set(existing.map((e) => e.name));

    const newEventTags = names
      .filter((name) => !existingNames.has(name))
      .map((name) => this.repository.create({ name }));

    if (newEventTags.length > 0) {
      await this.repository.save(newEventTags);
    }

    return [...existing, ...newEventTags];
  }

  public async createEventTag(name: string): Promise<EventTagModel> {
    const eventTag = this.repository.create({ name });
    return await this.repository.save(eventTag);
  }
}
