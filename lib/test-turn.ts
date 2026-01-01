/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
/**
 * Test TURN Server Connectivity
 * Run this in browser console to verify TURN servers are working
 */

export async function testTurnServers() {
    console.log('🔍 Testing TURN server connectivity...\n');

    const { getIceServers } = await import('./ice-servers');
    const iceServers = await getIceServers();

    console.log('📋 ICE Servers configured:', iceServers);

    const pc = new RTCPeerConnection({ iceServers });

    const candidates = {
        host: 0,
        srflx: 0,
        relay: 0,
    };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            const type = event.candidate.type as 'host' | 'srflx' | 'relay';
            candidates[type]++;
            console.log(`✅ ICE Candidate [${type}]:`, event.candidate.candidate);
        } else {
            console.log('\n📊 ICE Gathering Complete:');
            console.log(`   Host candidates: ${candidates.host}`);
            console.log(`   Server Reflexive (STUN): ${candidates.srflx}`);
            console.log(`   Relay (TURN): ${candidates.relay}`);

            if (candidates.relay > 0) {
                console.log('\n✅ SUCCESS: TURN servers are working!');
                console.log('   Your app can connect across different networks.');
            } else {
                console.log('\n❌ WARNING: No TURN relay candidates!');
                console.log('   Connections may fail across different networks.');
                console.log('   Only local/same-network connections will work.');
            }

            pc.close();
        }
    };

    // Create offer to trigger ICE gathering
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    console.log('\n⏳ Gathering ICE candidates... (wait ~10 seconds)\n');
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
    (window as any).testTurnServers = testTurnServers;
}
