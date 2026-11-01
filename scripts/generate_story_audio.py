import asyncio
import edge_tts
import subprocess
import os
import json

SEGMENTS = [
    {
        "id": "act1_crisis",
        "text": "It is 5 PM during peak monsoon in Madurai. The Vaigai river has swollen, and heavy downpours are rapidly inundating low-lying arterial transit points. For thousands of citizens traveling home between Periyar Bus Stand and Mattuthavani, roads are turning into dangerous flood traps. But how does a smart city observe, protect commuters, and verify municipal response in real time?",
        "silence_after": 1.5
    },
    {
        "id": "act2_observe_3d",
        "text": "This is CivicPulse. Solar-powered ultrasonic sensors deployed at 8 critical bottlenecks stream live water depth telemetry directly to our operations room. Switching to 3D perspective, water depth is rendered not as flat circles, but as volumetric 3D prisms where height directly represents water level in centimeters. Notice the Sellur Railway Underpass submerged under 68 centimeters of floodwater.",
        "silence_after": 2.0
    },
    {
        "id": "act3_safe_routing",
        "text": "Now, observe the commuter experience. A citizen plans their commute from Periyar Bus Stand to Mattuthavani. The direct arterial route cuts straight through the submerged Sellur underpass. CivicPulse intercepts this route using Amazon Location Service, flags the critical flood intersection, and dynamically computes an elevated Safe Corridor detour via the Ring Road, keeping citizens completely safe.",
        "silence_after": 2.0
    },
    {
        "id": "act4_municipal_lakehouse",
        "text": "Simultaneously, in Municipal Operations, an automated triage engine ranks Sellur as the number one priority due to hospital access proximity. The commissioner dispatches emergency dewatering crews. As pumps drain the water, sensor levels drop, and this intervention is committed into Apache Iceberg v2 tables on Amazon S3 via Amazon Athena. The corridor is reopened, verified by real data.",
        "silence_after": 1.5
    },
    {
        "id": "act5_closing",
        "text": "With historical time travel across 18 hours of storm progression and complete district governance, CivicPulse turns raw spatial data into verifiable civic resilience. Built on AWS for Madurai.",
        "silence_after": 1.0
    }
]

VOICE = "en-IN-PrabhatNeural"

async def main():
    out_dir = "civicpulse/demo_video/story_audio"
    os.makedirs(out_dir, exist_ok=True)
    durations = []

    for i, seg in enumerate(SEGMENTS):
        part_path = f"{out_dir}/seg_{i}.mp3"
        print(f"Synthesizing {seg['id']} with {VOICE}...")
        comm = edge_tts.Communicate(seg["text"], VOICE, rate="+3%")
        await comm.save(part_path)

        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', part_path]
        res = subprocess.check_output(cmd)
        dur = float(json.loads(res)['format']['duration'])
        print(f"Segment {i} duration: {dur:.2f}s")
        durations.append({"index": i, "id": seg["id"], "duration": dur, "silence": seg["silence_after"]})

    with open(f"{out_dir}/durations.json", "w") as f:
        json.dump(durations, f, indent=2)

    # Concat all into story_narration.mp3
    concat_list = f"{out_dir}/concat.txt"
    with open(concat_list, "w") as f:
        for i in range(len(SEGMENTS)):
            f.write(f"file 'seg_{i}.mp3'\n")

    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
        '-i', concat_list, '-c', 'copy',
        'civicpulse/demo_video/story_narration.mp3'
    ])
    print("Full story narration generated at civicpulse/demo_video/story_narration.mp3")

if __name__ == "__main__":
    asyncio.run(main())
