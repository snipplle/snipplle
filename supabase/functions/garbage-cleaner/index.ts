import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
)

interface Version {
  path: string
}

async function removeAllFiles(metaPath: string): Promise<{ success: boolean }> {
  const { data, error } = await supabase.storage
    .from('snipplle')
    .download(metaPath)

  if (!data || error) {
    return {
      success: false,
    }
  }

  const metaData = JSON.parse(await data.text())

  const versionPaths = metaData.versions.map((version: Version) => version.path)

  await supabase.storage.from('snipplle').remove([...versionPaths, metaPath])

  return {
    success: true,
  }
}

Deno.serve(async () => {
  const { data, error } = await supabase.from('snippet_garbage').select()

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  for (const item of data) {
    const { data: isUsed, error: usageError } = await supabase
      .from('collection_snippets')
      .select()
      .eq('snippet_id', item.snippetId)
      .single()

    if (usageError) {
      continue
    }

    if (isUsed) {
      continue
    }

    const { success } = await removeAllFiles(item.path)

    if (!success) {
      continue
    }

    await supabase.from('snippet_garbage').delete().eq('id', item.id)
  }

  return new Response(undefined, { status: 200 })
})
