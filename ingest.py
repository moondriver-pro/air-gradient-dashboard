import os
import sys
import time
import logging
import requests
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger(__name__)

# Configuration — secrets must be supplied via environment
AIR_GRADIENT_TOKEN = os.environ.get("AIR_GRADIENT_TOKEN")
INFLUXDB_TOKEN = os.environ.get("INFLUXDB_TOKEN")
INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://influxdb:8086")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "airgradient")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "air_data")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))

API_URL = "https://api.airgradient.com/public/api/v1/locations/measures/current"

FIELDS = [
    "pm01", "pm02", "pm10", "pm01_corrected", "pm02_corrected", "pm10_corrected",
    "pm003Count", "atmp", "rhum", "rco2", "atmp_corrected", "rhum_corrected",
    "rco2_corrected", "wifi", "tvoc", "tvocIndex", "noxIndex",
]


def validate_config():
    missing = [name for name, val in [
        ("AIR_GRADIENT_TOKEN", AIR_GRADIENT_TOKEN),
        ("INFLUXDB_TOKEN", INFLUXDB_TOKEN),
    ] if not val]
    if missing:
        log.error("Missing required environment variables: %s", ", ".join(missing))
        sys.exit(1)


def fetch_data():
    try:
        response = requests.get(
            API_URL,
            params={"token": AIR_GRADIENT_TOKEN},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        log.error("Timeout fetching data from AirGradient API")
    except requests.exceptions.HTTPError as e:
        log.error("HTTP error from AirGradient API: %s", e)
    except requests.exceptions.RequestException as e:
        log.error("Error fetching data: %s", e)
    return None


def push_to_influx(data, write_api):
    points_written = 0
    for item in data:
        point = (
            Point("air_quality")
            .tag("locationId", item.get("locationId"))
            .tag("locationName", item.get("locationName"))
            .tag("serialno", item.get("serialno"))
            .tag("model", item.get("model"))
            .tag("locationType", item.get("locationType"))
        )

        has_fields = False
        for field in FIELDS:
            value = item.get(field)
            if value is not None:
                point.field(field, float(value))
                has_fields = True

        if not has_fields:
            log.warning("No fields found for %s, skipping", item.get("locationName"))
            continue

        if item.get("timestamp"):
            dt = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
            point.time(dt)

        write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
        points_written += 1

    log.info("Wrote %d point(s) to InfluxDB", points_written)


def main():
    validate_config()
    log.info("Starting AirGradient ingestion service (poll interval: %ds)", POLL_INTERVAL)

    client = None
    while client is None:
        try:
            client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
            client.health()
            log.info("Connected to InfluxDB at %s", INFLUXDB_URL)
        except Exception as e:
            log.warning("Waiting for InfluxDB: %s", e)
            time.sleep(5)
            client = None

    write_api = client.write_api(write_options=SYNCHRONOUS)

    while True:
        data = fetch_data()
        if data:
            try:
                push_to_influx(data, write_api)
            except Exception as e:
                log.error("Failed to write to InfluxDB: %s", e)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
