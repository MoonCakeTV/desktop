.PHONY: dev mod origin tea

dev:
	wails dev

mod:
	go mod tidy

origin:
	git push origin main && \
	git push origin --tags

tea:
	git push tea main && \
	git push tea --tags
