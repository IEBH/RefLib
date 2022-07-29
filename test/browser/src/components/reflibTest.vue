<script>
import reflib from '@iebh/reflib';

export default {
	data() { return {
		formats: reflib.formats,
		refs: undefined,
		mode: 'waiting', // ENUM: 'waiting', 'processing', 'done'
		progressCurrent: 0,
		progressMax: 0,
	}},
	methods: {
		fileImport() {
			reflib.uploadFile({
				onStart: ()=> {
					this.mode = 'processing';
					return this.$nextTick(); // Wait for Vue to redraw
				},
				onProgress: (current, max) => {
					vm.progressCurrent = current;
					this.progressMax = max;
				},
				onEnd: ()=> {
					this.mode = 'done';
				},
			})
				.then(refs => this.refs = refs)
				.then(()=> this.mode = 'done')
		},
	},
}
</script>

<template>
	<!-- Navigation -->
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
		<div class="container px-4">
			<a class="navbar-brand" href="#page-top">RefLib</a>
			<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
			<div class="collapse navbar-collapse" id="navbarResponsive">
				<ul class="navbar-nav ms-auto">
					<li class="nav-item"><a class="nav-link" href="https://github.com/IEBH/RefLib" target="_blank">GitHub</a></li>
				</ul>
			</div>
		</div>
	</nav>

	<!-- Header-->
	<header class="bg-primary bg-gradient text-white">
		<div class="container px-4 text-center">
			<h1 class="fw-bolder">RefLib Browser test</h1>
			<p class="lead">Simple citation library read/write tests for the browser</p>
			<a class="btn btn-lg btn-light" @click="fileImport()">Open citation file</a>
			<p class="small mt-2">
				Formats supported:
				{{
					Object.values(formats)
					.filter(f => f.canRead)
					.map(f => f.titleShort)
					.join(', ')
				}}
			</p>
		</div>
	</header>

	<!-- Processing marker -->
	<section v-if="mode == 'processing'" class="mt-4">
		<div class="container px-4">
			<div class="row gx-4 justify-content-center">
				<div class="col-lg-8 text-center my-2">
					<h1>
						<i class="fas fa-spinner fa-spin"/>
						Loading citations...
					</h1>
					<div v-if="progressMax > 0" class="mt-1">
						<div class="progress">
							<div
								class="progress-bar progress-bar-striped progress-bar-animated"
								role="progressbar"
								:style="{width: (progress.curent / progressMax) * 100 + '%'}"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Ref list section-->
	<section v-if="mode == 'done' && refs" class="mt-4">
		<div class="container px-4">
			<div class="row gx-4 justify-content-center">
				<div class="col-12">
					<table class="table table-striped">
						<thead>
							<tr>
								<th>Title</th>
								<th>Authors</th>
								<th>Year</th>
								<th>Journal</th>
								<th>Volume</th>
								<th>Pages</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(ref, refIndex) in refs" :key="refIndex">
								<td>{{ref.title}}</td>
								<td>{{(ref.authors || []).join(', ')}}</td>
								<td>{{ref.year}}</td>
								<td>{{ref.journal}}</td>
								<td>{{ref.volume}}</td>
								<td>{{ref.pages}}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
header {
    padding-top: 9.5rem;
    padding-bottom: 6rem;
}
</style>
