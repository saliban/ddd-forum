
import { BaseController } from "../../../../../shared/infra/http/models/BaseController";
import { UpvotePost } from "./UpvotePost";
import { DecodedExpressRequest } from "../../../../users/infra/http/models/decodedRequest";
import { UpvotePostDTO } from "./UpvotePostDTO";
import { UpvotePostErrors } from "./UpvotePostErrors";

export class UpvotePostController extends BaseController {
  private useCase: UpvotePost;

  constructor (useCase: UpvotePost) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const req = this.req as DecodedExpressRequest;
    const { userId } = req.decoded;

    const dto: UpvotePostDTO = {
      userId: userId,
      slug: this.req.body.slug
    }
  
    try {
      const result = await this.useCase.execute(dto);

      if (result.isLeft()) {
        const error = result.value;
  
        switch (error.constructor) {
          case UpvotePostErrors.MemberNotFoundError:
          case UpvotePostErrors.PostNotFoundError:
            return this.notFound(error.errorValue().message)
          case UpvotePostErrors.AlreadyUpvotedError:
            return this.conflict(error.errorValue().message)
          default:
            return this.fail(error.errorValue().message);
        }
        
      } else {
        return this.ok(this.res);
      }

    } catch (err) {
      return this.fail(err)
    }
  }
}