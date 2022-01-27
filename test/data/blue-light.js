import {expect} from 'chai';

/**
* Manual coding for example references, these are compared in each respective `test/${module}.js` test kit
* @type {array<Object>}
*/
export let testRefs = [
	{
		recNumber: '926',
		type: 'journalArticle',
		title: 'A review of photodynamic therapy (PDT) for the treatment of acne vulgaris',
		authors: [
			'Riddle, C. C.',
			'Terrell, S. N.',
			'Menser, M. B.',
			'Aires, D. J.',
			'Schweiger, E. S.',
		],
		journal: 'J Drugs Dermatol',
		year: '2009',
		pages: '1010-9',
		volume: '8',
		number: '11',
		abstract: 'BACKGROUND: Photodynamic therapy (PDT) is increasing in dermatology. Antibiotic resistance and the challenges of isotretinoin therapy have led to investigation of PDT in the treatment of acne vulgaris. OBJECTIVE: To review the results of clinical trials and case series with respect to light source, topical photosensitizing agent, adverse events, efficacy and skin type. METHODS: A non-critical review is presented of a PubMed search for studies examining PDT in the treatment of acne vulgaris. RESULTS: The authors found 21 clinical trials and case series of various designs. Eight studies employed a split-face design comparing photosensitizer to placebo, no treatment or another photosensitizer. Two trials used three test spots and one control spot per patient. Three studies utilized control subjects receiving no photosensitizer with or without light therapy. All 21 studies reported a reduction in inflammatory lesions and/or a significant improvement in acne. The light sources utilized included blue light, pulsed-dye laser (PDL), intense pulsed light (IPL) and red light. Studies comparing the use of PDT to light therapy alone demonstrated greater improvement in treatment groups pretreated with a photosensitizer. CONCLUSION: All studies reported reduction in inflammatory lesions or significant improvement in acne. Several studies confirm a light source combined with photosensitizer is superior to light alone. Adverse reactions including photosensitivity, pustular eruptions, and crusting varied among photosensitizers and light sources. PDT appears to be a useful therapeutic option for acne patients who are recalcitrant to standard treatments and poor candidates for systemic retinoids. Further studies are still needed before a consensus protocol can be established. Additional investigations are needed to establish optimal incubation time, activating light source and frequency of treatment.',
		isbn: '1545-9616 (Print)\r1545-9616',
		// pmid: '19894368',
	},
]


export function compareTestRefs(refs) {
	expect(refs).to.be.an('array');
	expect(refs).to.have.length(102);

	testRefs.forEach(originalRef => {
		let computedRef = refs.find(r => r.title == originalRef.title || r.recNumber == originalRef.recNumber);

		expect(computedRef).to.be.an('object');
		Object.entries(originalRef).forEach(([key, val]) => {
			expect(computedRef).to.have.property(key);
			expect(computedRef[key]).to.deep.equal(val);
		});
	});
}
