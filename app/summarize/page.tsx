"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner";

const formSchema = z.object({
  link: z.url(),
});

export default function SummarizePage() {
  const [links, updateLinks] = useState<string[] | null>(null)

  const linkForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: "",
    },
  });

  function removeLink(link: string) {
    updateLinks(links?.filter((item) => item !== link) ?? null);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {

    if(links && links?.indexOf(values.link) > -1){
      linkForm.reset();
      toast("Link has already been added!");
      return;
    }

    if(links === null){
      updateLinks([values.link])
    }else{
      updateLinks([...links, values.link])
    }

    linkForm.reset();
    console.log(links)
  }
  return (
    <div>
      <div className="mb-5">
      {links?.map(item => (
      <Badge key={item} className="gap-1">
        {item}
        <Button className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeLink(item)}>
        <XIcon />
        </Button>

      </Badge>
        ))}
      </div>


      <Form {...linkForm}>
        <form
          onSubmit={linkForm.handleSubmit(onSubmit)}
          className="space-x-8 flex flex-row"
        >
          <FormField
            control={linkForm.control}
            name="link"
            render={({ field }) => (
              <FormItem className="flex-2">
                <FormControl>
                  <Input placeholder="Link" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button variant="default" size="icon" aria-label="Submit">
            <PlusIcon />
          </Button>
        </form>
      </Form>

      <hr className="mt-2 mb-2 text-gray-300" />

      <Button>Generate</Button>
    </div>
  );
}
