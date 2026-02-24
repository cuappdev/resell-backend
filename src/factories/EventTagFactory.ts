// EventTagFactory.ts
import { define } from 'typeorm-seeding';
import { EventTagModel } from '../models/EventTagModel';

// Define a factory for EventTagModel
define(EventTagModel, (_, context?: { name?: string }) => {
  const eventTag = new EventTagModel();

  const eventTagName = context?.name ?? 'start_of_semester';
  eventTag.name = eventTagName;

  return eventTag;
});
