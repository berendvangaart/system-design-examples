import { Event } from '../../events/event.entity.js';
import { Seat } from '../../seats/seat.entity.js';
import dataSource from './data-source.js';

const EVENT_NAME = 'Demo Concert';
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 10;
const PRICE_CENTS = 2500;

await dataSource.initialize();
try {
  await dataSource.transaction(async (manager) => {
    if (await manager.existsBy(Event, { name: EVENT_NAME })) {
      console.log(`Event "${EVENT_NAME}" already exists, skipping seed.`);
      return;
    }

    const event = await manager.save(
      manager.create(Event, { name: EVENT_NAME }),
    );
    const seats = ROWS.flatMap((row) =>
      Array.from({ length: SEATS_PER_ROW }, (_, i) =>
        manager.create(Seat, {
          eventId: event.id,
          row,
          number: i + 1,
          priceCents: PRICE_CENTS,
        }),
      ),
    );
    await manager.insert(Seat, seats);

    console.log(`Seeded event ${event.id} with ${seats.length} seats.`);
  });
} finally {
  await dataSource.destroy();
}
