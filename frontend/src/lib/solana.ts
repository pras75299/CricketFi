import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

// For the hackathon MVP, we use devnet and a mocked USDC mint if standard devnet USDC isn't available
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
export const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Standard Devnet USDC
export const TREASURY_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TREASURY || '11111111111111111111111111111111');

export const connection = new Connection(SOLANA_RPC, 'confirmed');

/**
 * Creates a transaction to pay the contest entry fee in USDC.
 * Note: For production, this should be an Anchor instruction call to `join_contest` 
 * which internally handles the USDC transfer to the Contest PDA.
 */
export async function createEntryFeeTransaction(
    userPublicKey: PublicKey,
    entryFeeUsdc: number
): Promise<Transaction> {
    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: userPublicKey,
    });

    try {
        // USDC has 6 decimals
        const transferAmount = entryFeeUsdc * 1_000_000;

        const userUsdcAta = await getAssociatedTokenAddress(USDC_MINT, userPublicKey);
        const treasuryUsdcAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET);

        const transferIx = createTransferInstruction(
            userUsdcAta,
            treasuryUsdcAta,
            userPublicKey,
            transferAmount
        );

        transaction.add(transferIx);
    } catch (e) {
        console.warn("Using fallback SOL transfer for dev as SPL Token ATA generation failed", e);
        // Fallback for easy testing without spl tokens
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: userPublicKey,
                toPubkey: TREASURY_WALLET,
                lamports: (entryFeeUsdc / 100) * LAMPORTS_PER_SOL,
            })
        );
    }

    return transaction;
}
