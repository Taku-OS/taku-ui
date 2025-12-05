import z from 'zod'

export const configSchema = z.object({
  $schema: z.string().optional(),
  style: z.enum(['default', 'new-york']).default('default'),
  tailwind: z.object({
    config: z.string(),
    css: z.string(),
    baseColor: z.enum(['slate', 'gray', 'zinc', 'neutral', 'stone']).default('slate'),
    cssVariables: z.boolean().default(true),
  }),
  rsc: z.boolean().default(false),
  tsx: z.boolean().default(true),
  aliases: z.object({
    components: z.string().default('@/components'),
    utils: z.string().default('@/lib/utils'),
    ui: z.string().optional(),
  }),
  registryUrl: z.string().url().optional(), // Custom registry URL
})

export type Config = z.infer<typeof configSchema>

export const rawConfigSchema = configSchema.extend({
  resolvedPaths: z.object({
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    utils: z.string(),
    components: z.string(),
    ui: z.string().optional(),
  }),
})

export type RawConfig = z.infer<typeof rawConfigSchema>
