import { Client, NFTokenCreateOffer, NFTokenAcceptOffer } from 'xrpl';

export async function createNFTOffer(
    client: Client, 
    wallet: any, 
    nftId: string, 
    amount: string, 
    isSell: boolean
): Promise<any> {
    const tx: NFTokenCreateOffer = {
        TransactionType: "NFTokenCreateOffer",
        Account: wallet.address,
        NFTokenID: nftId,
        Amount: amount,
        Flags: isSell ? 1 : 0 // 1 for Sell Offer, 0 for Buy Offer
    };
    return await client.submitAndWait(tx, { wallet });
}

export async function acceptNFTOffer(
    client: Client, 
    wallet: any, 
    offerIndex: string,
    isBuyOffer: boolean
): Promise<any> {
    const tx: NFTokenAcceptOffer = {
        TransactionType: "NFTokenAcceptOffer",
        Account: wallet.address
    };
    if (isBuyOffer) {
        tx.NFTokenBuyOffer = offerIndex;
    } else {
        tx.NFTokenSellOffer = offerIndex;
    }
    return await client.submitAndWait(tx, { wallet });
}
