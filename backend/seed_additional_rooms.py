import asyncio
import logging

from app.core.db import get_async_session
from app.services import coworkingservice

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def seed_additional_coworking_rooms():
    """
    Standalone script to seed the database by calling the coworking service.
    """
    async with get_async_session() as db:
        try:
            result = await coworkingservice.seed_default_rooms(db)
            logging.info(f"Seeding complete. Status: {result['status']}")
            logging.info(f"Rooms added: {result['total_added']}, Rooms skipped: {result['total_skipped']}")
        except Exception as e:
            logging.error(f"An error occurred during seeding: {e}")

if __name__ == "__main__":
    logging.info("Starting to seed additional coworking rooms...")
    asyncio.run(seed_additional_coworking_rooms())
    logging.info("Finished seeding additional coworking rooms.")
