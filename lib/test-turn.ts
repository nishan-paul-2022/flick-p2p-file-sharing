import { logger } from '@/lib/logger';

export async function testTurnServers() {
    logger.info('Testing TURN server connectivity...\n');

    const { getIceServers } = await import('@/lib/ice-servers');
    const iceServers = await getIceServers();

    logger.info('ICE Servers configured:', iceServers);

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
            logger.success(`ICE Candidate [${type}]:`, event.candidate.candidate);
        } else {
            logger.info('\n📊 ICE Gathering Complete:');
            logger.info(`   Host candidates: ${candidates.host}`);
            logger.info(`   Server Reflexive (STUN): ${candidates.srflx}`);
            logger.info(`   Relay (TURN): ${candidates.relay}`);

            if (candidates.relay > 0) {
                logger.success('SUCCESS: TURN servers are working!');
                logger.info('   Your app can connect across different networks.');
            } else {
                logger.warn('WARNING: No TURN relay candidates!');
                logger.info('   Connections may fail across different networks.');
                logger.info('   Only local/same-network connections will work.');
            }

            pc.close();
        }
    };

    // Trigger ICE gathering
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    logger.info('\n⏳ Gathering ICE candidates... (wait ~10 seconds)\n');
}

if (typeof window !== 'undefined') {
    window.testTurnServers = testTurnServers;
}
