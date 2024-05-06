import express, { Request, Response } from "express";
// import { networkName } from "@govtechsg/tradetrust-utils/constants/network";
import { networkName } from "@tradetrust-tt/tradetrust-utils/constants/network";

import { validateDocument } from "../../utils";
import { isValid } from "@tradetrust-tt/tt-verify";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	const {
		body: { document },
		query: { network = "mainnet" },
	} = req;

	try {
		console.log("start /");
		const fragments = await validateDocument({
			document,
			network: network as networkName,
		});
		res.status(200).json({
			summary: {
				all: isValid(fragments),
				documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
				documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
				issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"]),
			},
			fragments,
		});
	} catch (err) {
		res.status(400).json(err);
	}
});

export { router };
