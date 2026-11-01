import asyncio
import edge_tts
import os

SCRIPT_SEGMENTS = [
    {
        "name": "01_intro",
        "text": "Welcome to CivicPulse, a geospatial operations lakehouse built on AWS for Madurai, India. During monsoon storms, municipal teams must rapidly detect road inundations, calculate safe detours for commuters, and prioritize emergency pump dispatch.",
        "silence_after": 2.0
    },
    {
        "name": "02_3d_overview",
        "text": "Here in the Command Center, real-time ultrasonic depth sensors feed live water telemetry directly into a 3D cartographic operations canvas. Notice the volumetric water prisms extruded vertically in centimeters, highlighting high-risk underpasses like Sellur and Simmakkal.",
        "silence_after": 2.5
    },
    {
        "name": "03_routing",
        "text": "In Safe Corridor Routing, powered by Amazon Location Service, commuters select transit corridors such as Periyar Bus Stand to Mattuthavani. CivicPulse analyzes the route, flags active flood breaches, and computes an elevated safe corridor bypassing the flood zone.",
        "silence_after": 2.5
    },
    {
        "name": "04_timeline",
        "text": "Powered by Apache Iceberg v2 tables on Amazon S3 and queried through Amazon Athena, our Historical Timeline lets decision-makers travel back in time through the storm's progression, comparing hazard snapshots across 18 hours.",
        "silence_after": 2.0
    },
    {
        "name": "05_dispatch_and_governance",
        "text": "In Municipal Operations, automated triage scoring ranks dispatch priority for high-capacity dewatering crews. Interventions are executed and recorded to an immutable civic audit ledger, ensuring verified road clearance and district-wide resilience.",
        "silence_after": 1.0
    }
]

VOICE = "en-US-ChristopherNeural"

async def main():
    os.makedirs("civicpulse/demo_video/audio_parts", exist_ok=True)
    part_files = []

    for i, seg in enumerate(SCRIPT_SEGMENTS):
        part_path = f"civicpulse/demo_video/audio_parts/part_{i}.mp3"
        print(f"Generating audio for segment {i+1}/{len(SCRIPT_SEGMENTS)}...")
        comm = edge_tts.Communicate(seg["text"], VOICE, rate="+3%")
        await comm.save(part_path)
        part_files.append((part_path, seg["silence_after"]))

    print("All audio segments generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())

