resource "null_resource" "generate_readme" {
  provisioner "local-exec" {
    command = "./scripts/generate_readme.sh"
  }

  triggers = {
    always_run = timestamp()
  }
}
